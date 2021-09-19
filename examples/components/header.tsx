import { useState } from "react"

const pages: Array<{ title: string; url: string }> = [
    {
        title: "List",
        url: "/list",
    }
]

export function Header({ selectedIndex }: { selectedIndex: number }) {
    const [open, setOpen] = useState(false)
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">
                    co-virtualize examples
                </a>
                <button
                    className="navbar-toggler"
                    onClick={() => setOpen(!open)}
                    type="button">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`align-self-flex-end navbar-collapse ${open ? "" : "collapse"}`}>
                    <ul className="navbar-nav">
                        {pages.map(({ title, url }, index) => (
                            <li key={title} className="nav-item">
                                <a className={`nav-link ${index === selectedIndex ? "active" : ""}`} href={url}>
                                    {title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    )
}
