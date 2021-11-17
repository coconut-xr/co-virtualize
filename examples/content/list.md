# List Example

We create a list of numbers 0-99 and will filter them using a text input.

To animate the filtered numbers we virtualize them to control them even after they are filtered.

## Virtualized List Item

We create a list item that is virtualized using the `useVirtual` hook.  
The virtualized item, in this case the `ListItem`, it's properties, the index at which it should be rendered and a uniquie identifier is passed into the hook.

This way we can render a `VirtualizedListItem`, which will result in the creation of a normal `ListItem`. However, the `ListItem` can live even after the `VirtualizedListItem` is removed from the dom.

```typescript
function VirtualizedListItem({
    children,
    id,
    index,
}: PropsWithChildren<{
    id: string
    index: number
}>) {
    useVirtual(ListItem, { children }, index, id)
    return null
}
```

<br/>

## List

Let's create the list, which manages the `VirtualizedListItem`s.  
Based on the `filter` value we filter an array with values 0-99 if it includes the filter string.

```typescript
function List({ filter }: { filter: string }) {
    return (
        <>
            {new Array(100)
                .fill(null)
                .map((_, i) => i)
                .filter((i) => i.toString().includes(filter))
                .map((i) => (
                    <VirtualizedListItem index={i} id={i.toString()} key={i}>
                        {i}
                    </VirtualizedListItem>
                ))}
        </>
    )
}
```

<br/>

## ListItem

Now to the `ListItem` that actually gets rendered. The component gets controller properties and a `destroy` function as properties.  
The `controllerProps` is an array with all the props from all the controllers. In our case we will only have one or none controller. If the amount of controller is zero, we animate the disposal of the component and then destroy it.
The `Transition` Example shows what can be done with multiple controllers attached to one virtual component.

For this example we use `react-spring` to animate the `maxWidth`, `padding`, `opacity` based on `controllerProps.length > 0`, which states whether their are any controllers connected.

We store the `children` property into the `childrenRef` to ensure we keep the value even after the controller has been removed, which will empty the `controllerProps` array.

```typescript
function ListItem({
    destroy,
    controllerProps,
}: VirtualProps<{
    children: ReactNode
}>) {
    const childrenRef = useRef(controllerProps[0]?.children)
    const [{ maxWidth, padding, opacity }, api] = useSpring(
        {
            maxWidth: 0,
            padding: 0,
            opacity: 0,
            onRest: {
                maxWidth: (val) => {
                    if (val.value === 0) {
                        destroy()
                    }
                },
            },
        },
        []
    )
    const connected = controllerProps.length > 0
    useEffect(() => {
        api.start({
            maxWidth: connected ? 50 : 0,
            padding: connected ? 10 : 0,
            opacity: connected ? 1 : 0,
        })
    }, [connected])
    const children = useMemo(() => {
        if (controllerProps.length > 0) {
            childrenRef.current = controllerProps[0].children
        }
        return childrenRef.current
    }, [controllerProps])
    return (
        <a.span
            style={{
                opacity,
                paddingLeft: padding,
                paddingTop: 10,
                paddingBottom: 10,
                paddingRight: padding,
                fontSize: 30,
                maxWidth,
                overflow: "hidden",
            }}>
            {children}
        </a.span>
    )
}
```

<br/>

## Page

Now let's bring everything together into a page, including a toggle button.  
We have to wrap the `List` into a `VirtualBase` component, which serves as the base where all the virtual items will be added.  
The `VirtualBase` keeps track of all the virtual components and provides them with the `destroy` and `connected` properties.

```typescript
function Page() {
    const [search, setSearch] = useState("")
    return (
        <div className="p-3" style={{ display: "flex", flexDirection: "column" }}>
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                className="form-control"
                placeholder="Search"
            />
            <div
                style={{
                    flexWrap: "wrap",
                    display: "flex",
                    flexDirection: "row",
                }}>
                <VirtualBase>
                    <List filter={search} />
                </VirtualBase>
            </div>
        </div>
    )
}
```
