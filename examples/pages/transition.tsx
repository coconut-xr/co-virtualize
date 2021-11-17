import React, { createContext, useContext, useMemo } from "react"
import Head from "next/head"
import { useVirtual, VirtualBase, VirtualProps } from "co-virtualize"
import { useSpring, a, SpringValue } from "@react-spring/web"
import { Header } from "../components/header"
import { Footer } from "../components/footer"
import MD from "../content/transition.md"

export default function Index() {
    const { value } = useSpring({ value: 0 })
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
            <input
                defaultValue={0}
                min={0}
                max={2}
                step={0.01}
                type="range"
                onChange={(e) => value.start(e.target.valueAsNumber)}
            />
            <div style={{ width: "100%", overflow: "hidden", flexShrink: 0, height: 300, position: "relative" }}>
                <SpringValueContext.Provider value={value}>
                    <VirtualBase>
                        <VirtualizedRectangle index={0} value={0} />
                        <VirtualizedRectangle index={1} value={1} />
                        <VirtualizedRectangle index={2} value={0.5} />
                    </VirtualBase>
                </SpringValueContext.Provider>
            </div>
            <div className="border-top border-2 bt-1 p-3">
                <MD />
            </div>
            <Footer />
        </div>
    )
}

function VirtualizedRectangle({ value, index }: { value: number; index: number }) {
    useVirtual(Rectangle, { index, value }, undefined, "abc")
    return null
}

const SpringValueContext = createContext<SpringValue<number>>(null as any)

function Rectangle({
    controllerProps,
}: VirtualProps<{
    index: number
    value: number
}>) {
    const value = useContext(SpringValueContext)
    const left = useMemo(
        () =>
            value.to(
                (v) =>
                    controllerProps.reduce(
                        (prev, { index, value }) => prev + Math.max(0, 1 - Math.abs(v - index)) * value,
                        0
                    ) *
                    window.innerWidth *
                    0.8
            ),
        [value, ...controllerProps]
    )
    return (
        <a.div
            style={{
                position: "absolute",
                left,
                width: "20vw",
                height: 300,
                background: "#f00",
            }}
        />
    )
}
