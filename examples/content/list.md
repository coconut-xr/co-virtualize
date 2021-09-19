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
    index
}: PropsWithChildren<{
    id: string,
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
```
<br/>

## ListItem

Now to the `ListItem` that actually gets rendered. Aside from the properties passed by the `VirtualListItem`, in this case only the `children` property, we also get a `connected` flag and a `destroy` function as properties.  
The `connected` flag is true when owner component is alive. As soon as the `ListItem` gets destroyed, the `connected` flag we turn false and all the properties assigned by the owner are removed.  
The `destroy` function enables the `ListItem` to destroy iteself after it's not needed anymore. In this case we destroy it after the element is not visible anymore.

For this example we use `react-spring` to animate the `maxWidth`, `padding`, `opacity` based on the `connected` flag.

We store the `children` property into the `childrenRef` to ensure we keep the value even after it is removed we it's owner, the `ListItem`, is disconnected.

```typescript
function ListItem({
    destroy,
    connected,
    children: c
}: PropsWithChildren<VirtualProps>) {
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
    
    const childrenRef = useRef(c)
    const children = useMemo(() => {
        if (connected) {
            childrenRef.current = c
        }
        return childrenRef.current
    }, [connected, c])
    return <a.span style={{
        opacity,
        paddingLeft: padding,
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: padding,
        fontSize: 30,
        maxWidth,
        overflow: "hidden"
    }}>
        {children}
    </a.span>
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
                onChange={e =>setSearch(e.target.value)}
                type="text"
                className="form-control"
                placeholder="Search"
            />
            <div style={{
                flexWrap: "wrap",
                display: "flex",
                flexDirection: "row"
            }}>
                <VirtualBase>
                    <List filter={search} />
                </VirtualBase>
            </div>
        </div>
    )
}
```