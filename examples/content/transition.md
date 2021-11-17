# Transition Example

We create three controllers, that all connect to the same virtual component. The virtual component then interpolates the values, retrieved from it's controllers based on the slider value.

The slider goes from `0 - 2` and the controllers are defined as follows:

```typescript
<VirtualizedRectangle index={0} value={0} />
<VirtualizedRectangle index={1} value={1} />
<VirtualizedRectangle index={2} value={0.5} />
```

This makes the reactangle start on the left, go to the right, when the slider is at 50%, and the go to the middle, when the slider is at 100%.

# Source Code

```typescript
export default function Index() {
    const { value } = useSpring({ value: 0 })
    return (
        <div className="d-flex flex-column">
            <input
                defaultValue={0}
                min={0}
                max={2}
                step={0.01}
                type="range"
                onChange={(e) => value.start(e.target.valueAsNumber)}
            />
            <div style={{ width: "100%", overflow: "hidden", height: 300, position: "relative" }}>
                <SpringValueContext.Provider value={value}>
                    <VirtualBase>
                        <VirtualizedRectangle index={0} value={0} />
                        <VirtualizedRectangle index={1} value={1} />
                        <VirtualizedRectangle index={2} value={0.5} />
                    </VirtualBase>
                </SpringValueContext.Provider>
            </div>
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
```
