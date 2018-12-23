import ExternalLinkIcon from 'mdi-react/ExternalLinkIcon'
import HelpCircleOutlineIcon from 'mdi-react/HelpCircleOutlineIcon'
import SearchIcon from 'mdi-react/SearchIcon'
import * as React from 'react'
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap'

interface State {
    isOpen: boolean
}

/**
 * A search button with a dropdown with related links.
 */
export class SearchButton extends React.Component<{}, State> {
    public state: State = { isOpen: true }

    public render(): JSX.Element | null {
        const docsURLPrefix = window.context.sourcegraphDotComMode ? 'https://docs.sourcegraph.com' : '/help'

        return (
            <ButtonDropdown isOpen={this.state.isOpen} toggle={this.toggleIsOpen} className="search-button">
                <button className="btn btn-primary rounded-0" type="submit">
                    <SearchIcon className="icon-inline" />
                    <span className="search-button__label">Search</span>
                </button>
                <DropdownToggle caret={false} className="px-1 d-flex border-0 text-muted rounded-right">
                    <HelpCircleOutlineIcon className="icon-inline small" />
                </DropdownToggle>
                <DropdownMenu right={true}>
                    <DropdownItem header={true}>
                        <strong>Search reference</strong>
                    </DropdownItem>
                    <DropdownItem divider={true} />
                    <DropdownItem header={true}>Common search keywords:</DropdownItem>
                    <ul className="list-unstyled px-2 mb-2">
                        <li>
                            <code>
                                repo:<strong>my/repo</strong>
                            </code>
                        </li>
                        {!window.context.sourcegraphDotComMode && (
                            <li>
                                <code>
                                    repo:<strong>github.com/myorg/</strong>
                                </code>
                            </li>
                        )}
                        <li>
                            <code>
                                file:<strong>my/file</strong>
                            </code>
                        </li>
                        <li>
                            <code>
                                lang:<strong>javascript</strong>
                            </code>
                        </li>
                        <li>
                            <code>
                                "<strong>fs.open(f)</strong>"
                            </code>
                        </li>
                        <li>
                            <code>
                                /<strong>(read|write)File</strong>/
                            </code>
                        </li>
                        <li className="text-muted small">
                            Plain terms are regexps (<code>/</code> optional).
                        </li>
                    </ul>
                    <DropdownItem divider={true} />
                    <DropdownItem header={true}>Diff/commit search keywords:</DropdownItem>
                    <ul className="list-unstyled px-2 mb-2">
                        <li>
                            <code>type:diff</code> <em className="text-muted small">or</em> <code>type:commit</code>
                        </li>
                        <li>
                            <code>
                                after:<strong>"2 weeks ago"</strong>
                            </code>
                        </li>
                        <li>
                            <code>
                                author:<strong>alice@example.com</strong>
                            </code>
                        </li>
                        <li className="text-nowrap">
                            <code>
                                repo:<strong>r@*refs/heads/</strong>
                            </code>{' '}
                            <span className="text-muted small">(all branches)</span>
                        </li>
                    </ul>
                    <DropdownItem divider={true} />
                    <a href={`${docsURLPrefix}/user/search/queries`} className="dropdown-item" target="_blank">
                        <ExternalLinkIcon className="icon-inline" /> All search keywords
                    </a>
                </DropdownMenu>
            </ButtonDropdown>
        )
    }

    private toggleIsOpen = () => this.setState(prevState => ({ isOpen: !prevState.isOpen }))
}
