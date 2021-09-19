import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react"
import Head from "next/head"
import { useVirtual, VirtualBase, VirtualProps } from "co-virtualize"
import { useSpring, a } from "react-spring"
import { Header } from "../components/header"
import { Footer } from "../components/footer"
import MD from "../content/list.md"

export default function Index() {
    const [search, setSearch] = useState("")
    return (
        <div className="d-flex flex-column fullscreen">
            <Head>
                <title>co-virtualize</title>
                <meta
                    name="description"
                    content="At Coconut XR we bring 3D to the Web, Augmented Reality (AR), Virtual Reality (VR) and XR / WebXR. We connect people and business using the latest collaboration and multiuser technologies with a strong background in cloud and distributed development. With many years of experience in software development and fresh ideas we thrive to build the applications of the future."></meta>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="icon" type="image/svg+xml" href="/res/icon.svg" />
                <link rel="mask-icon" href="/res/icon.svg" color="#fff" />
            </Head>
            <Header selectedIndex={0} />
            <div className="p-3" style={{ display: "flex", flexDirection: "column" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} type="text" className="form-control" placeholder="Search" />
                <div style={{ flexWrap: "wrap", display: "flex", flexDirection: "row" }}>
                    <VirtualBase>
                        <List filter={search} />
                    </VirtualBase>
                </div>
            </div>
            <div className="border-top border-2 bt-1 p-3">
                <MD />
            </div>
            <Footer />
        </div>
    )
}

function List({ filter }: { filter: string }) {
    return <>
        {
            new Array(100).fill(null)
                .map((_, i) => i)
                .filter((i) => i.toString().includes(filter))
                .map((i) =>
                    <VirtualizedListItem index={i} id={i.toString()} key={i}>{i}</VirtualizedListItem>
                )
        }
    </>
}

function VirtualizedListItem({ children, id, index }: PropsWithChildren<{ id: string, index: number }>) {
    useVirtual(ListItem, { children }, index, id)
    return null
}

function ListItem({ destroy, connected, children: c }: PropsWithChildren<VirtualProps>) {
    const childrenRef = useRef(c)
    const [{ maxWidth, padding, opacity }, api] = useSpring({
        maxWidth: 0,
        padding: 0,
        opacity: 0,
        onRest: {
            maxWidth: (val) => {
                if (val.value === 0) {
                    destroy()
                }
            }
        }
    }, [])
    useEffect(() => {
        api.start({
            maxWidth: connected ? 50 : 0,
            padding: connected ? 10 : 0,
            opacity: connected ? 1 : 0
        })
    }, [connected])
    const children = useMemo(() => {
        if (connected) {
            childrenRef.current = c
        }
        return childrenRef.current
    }, [connected, c])
    return <a.span style={{ opacity, paddingLeft: padding, paddingTop: 10, paddingBottom: 10, paddingRight: padding, fontSize: 30, maxWidth, overflow: "hidden" }}>{children}</a.span>
}
