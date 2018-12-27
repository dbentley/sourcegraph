import { DiffPart, JumpURLFetcher } from '@sourcegraph/codeintellify'
import { Location } from '@sourcegraph/extension-api-types'
import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { HoverMerged } from '../../../../../shared/src/api/client/types/hover'
import { TextDocumentIdentifier } from '../../../../../shared/src/api/client/types/textDocument'
import { TextDocumentPositionParams } from '../../../../../shared/src/api/protocol'
import { Controller } from '../../../../../shared/src/extensions/controller'
import {
    AbsoluteRepoFilePosition,
    FileSpec,
    parseRepoURI,
    PositionSpec,
    RepoSpec,
    ResolvedRevSpec,
    RevSpec,
    ViewStateSpec,
} from '../../../../../shared/src/util/url'

export interface LSPRequest {
    method: string
    params: any
}

/** LSP proxy error code for unsupported modes */
export const EMODENOTFOUND = -32000

export function isEmptyHover(hover: HoverMerged | null): boolean {
    return !hover || !hover.contents || (Array.isArray(hover.contents) && hover.contents.length === 0)
}

export function createJumpURLFetcher(
    fetchDefinition: SimpleProviderFns['fetchDefinition'],
    buildURL: (
        pos: RepoSpec & RevSpec & FileSpec & Partial<PositionSpec> & Partial<ViewStateSpec> & { part?: DiffPart }
    ) => string
): JumpURLFetcher<RepoSpec & RevSpec & FileSpec & ResolvedRevSpec & Partial<ViewStateSpec>> {
    return ({ line, character, part, repoName, viewState, ...rest }) =>
        fetchDefinition({ ...rest, repoName, position: { line, character } }).pipe(
            map(def => {
                const defArray = Array.isArray(def) ? def : [def]
                def = defArray[0]
                if (!def) {
                    return null
                }

                const uri = parseRepoURI(def.uri)
                return buildURL({
                    repoName: uri.repoName,
                    rev: uri.rev!,
                    filePath: uri.filePath!, // There's never going to be a definition without a file.
                    position: def.range
                        ? {
                              line: def.range.start.line + 1,
                              character: def.range.start.character + 1,
                          }
                        : { line: 0, character: 0 },
                    viewState,
                    part,
                })
            })
        )
}

export interface SimpleProviderFns {
    fetchHover: (pos: AbsoluteRepoFilePosition) => Observable<HoverMerged | null>
    fetchDefinition: (pos: AbsoluteRepoFilePosition) => Observable<Location | Location[] | null>
}

export const toTextDocumentIdentifier = (pos: RepoSpec & ResolvedRevSpec & FileSpec): TextDocumentIdentifier => ({
    uri: `git://${pos.repoName}?${pos.commitID}#${pos.filePath}`,
})

const toTextDocumentPositionParams = (pos: AbsoluteRepoFilePosition): TextDocumentPositionParams => ({
    textDocument: toTextDocumentIdentifier(pos),
    position: {
        character: pos.position.character! - 1,
        line: pos.position.line - 1,
    },
})

export const createLSPFromExtensions = (extensionsController: Controller): SimpleProviderFns => ({
    // Use from() to suppress rxjs type incompatibilities between different minor versions of rxjs in
    // node_modules/.
    fetchHover: pos =>
        from(extensionsController.services.textDocumentHover.getHover(toTextDocumentPositionParams(pos))).pipe(
            map(hover => (hover === null ? HoverMerged.from([]) : hover))
        ),
    fetchDefinition: pos =>
        from(
            extensionsController.services.textDocumentDefinition.getLocations(toTextDocumentPositionParams(pos))
        ) as Observable<Location | Location[] | null>,
})
