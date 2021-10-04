import React, { ComponentType, createContext, ReactNode, useContext, useEffect, useMemo, useReducer } from "react"
import { v4 as uuid } from "uuid"

type VirtualBaseContext = {
    set: (id: string, index: number, component: ComponentType<any>, props: any) => void
    unset: (id: string) => void
}

const virtualBaseContext = createContext<VirtualBaseContext>(null as any)

type VirtualElements = Array<VirtualElement>
type ConnectedVirtualElement = {
    id: string
    index: number
    connected: true
    component: ComponentType<any>
    props: any
}
type VirtualElement =
    | {
          id: string
          index: number
          connected: false
          component: ComponentType<any>
          props: undefined
      }
    | ConnectedVirtualElement
type Action =
    | {
          type: "set"
          id: string
          component: ComponentType<any>
          index: number
          props: any
      }
    | {
          type: "unset"
          id: string
      }
    | {
          type: "destroy"
          id: string
      }

function reduce(elements: VirtualElements, action: Action): VirtualElements {
    switch (action.type) {
        case "set":
            return [
                ...elements.filter(({ id }) => id !== action.id),
                {
                    connected: true,
                    component: action.component,
                    index: action.index,
                    id: action.id,
                    props: action.props,
                },
            ].sort((e1, e2) => e1.index - e2.index)
        case "unset":
            return elements.map((element) =>
                action.id === element.id
                    ? {
                          ...element,
                          connected: false,
                          props: undefined,
                      }
                    : element
            )
        case "destroy":
            return elements.filter(({ id }) => id != action.id).sort((e1, e2) => e1.index - e2.index)
    }
}

/**
 * base for all virtual components
 * all useVirtual hooks must be inside a VirtualBase
 */
export function VirtualBase({ children }: { children?: ReactNode | undefined }): JSX.Element {
    const [elements, changeElements] = useReducer(reduce, [])
    const ctx = useMemo<VirtualBaseContext>(
        () => ({
            set: (id, index, component, props) => changeElements({ type: "set", id, index, props, component }),
            unset: (id) => changeElements({ type: "unset", id }),
        }),
        [changeElements]
    )
    const virtualElements = useMemo(
        () =>
            elements.map(({ component: C, id, props, connected }) => (
                <C key={id} connected={connected} destroy={() => changeElements({ type: "destroy", id })} {...props} />
            )),
        [elements, changeElements]
    )
    return (
        <virtualBaseContext.Provider value={ctx}>
            {children}
            {virtualElements}
        </virtualBaseContext.Provider>
    )
}

/**
 * additional properties available for virtual components
 */
export type VirtualProps = {
    /**
     * flag that represents whether the originator is still alive
     */
    connected: boolean
    /**
     * function to end own existance
     */
    destroy: () => void
}

/**
 * will create a virtual component inside the containing virtual base
 * @param component the component to be virtualized
 * @param props properties to pass to the component
 * @param index declares the order at which it should be rendered
 * @param id optional unique identifier to regain control of a previously created virtual component
 */
export function useVirtual<T>(
    component: ComponentType<Partial<T> & VirtualProps>,
    props: T,
    index?: number,
    id?: string
): void {
    const { set, unset } = useContext(virtualBaseContext)
    const identifier = useMemo(() => id ?? uuid(), [id])
    useEffect(() => {
        set(identifier, index ?? 0, component, props)
    }, [set, index, props, identifier, component])
    useEffect(() => () => unset(identifier), [identifier, unset])
}
