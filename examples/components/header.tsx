import React, { useState } from "react"
import Link from 'next/link'

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
                <Link href="/" passHref>
                    <a className="navbar-brand">
                        co-virtualize examples
                    </a>
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={() => setOpen(!open)}
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNavDropdown"
                    aria-controls="navbarNavDropdown"
                    aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`align-self-flex-end navbar-collapse ${open ? "" : "collapse"}`}>
                    <ul className="navbar-nav">
                        {pages.map(({ title, url }, index) => (
                            <li key={title} className="nav-item">
                                <Link href={url} passHref>
                                    <a className={`nav-link ${index === selectedIndex ? "active" : ""}`}>
                                        {title}
                                    </a>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    )
}
