import React, { ComponentType, createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { v4 as uuid } from "uuid"

type VirtualBaseContext = {
    set: (id: string, component: ComponentType<any>, index: number, props: any) => void
    unset: (id: string) => void
}

const virtualBaseContext = createContext<VirtualBaseContext>(null as any)

type VirtualElements = Array<VirtualElement>

type VirtualElement = {
    id: string
    index: number
    component: ComponentType<any>
} & (
    | {
          connected: false
          props: undefined
      }
    | {
          connected: true
          props: any
      }
)

function destroy(setElements: (fn: (elements: VirtualElements) => VirtualElements) => void, destroyId: string): void {
    setElements((elements) => elements.filter(({ id }) => id != destroyId).sort((e1, e2) => e1.index - e2.index))
}

function unset(setElements: (fn: (elements: VirtualElements) => VirtualElements) => void, unsetId: string): void {
    setElements((elements) =>
        elements.map((element) =>
            unsetId === element.id
                ? {
                      ...element,
                      connected: false,
                      props: undefined,
                  }
                : element
        )
    )
}

function set(
    setElements: (fn: (elements: VirtualElements) => VirtualElements) => void,
    newId: string,
    component: ComponentType<any>,
    index: number,
    props: any
): void {
    setElements((elements) =>
        [
            ...elements.filter(({ id }) => id !== newId),
            {
                connected: true,
                component,
                index,
                id: newId,
                props,
            },
        ].sort((e1, e2) => e1.index - e2.index)
    )
}

/**
 * base for all virtual components
 * all useVirtual hooks must be inside a VirtualBase
 */
export function VirtualBase({ children }: { children?: ReactNode | undefined }): JSX.Element {
    const [elements, setElements] = useState<VirtualElements>([])
    const ctx = useMemo<VirtualBaseContext>(
        () => ({
            set: set.bind(null, setElements),
            unset: unset.bind(null, setElements),
        }),
        []
    )
    const virtualElements = useMemo(
        () =>
            elements.map(({ component: C, id, props, connected, index }) => (
                <C
                    key={id}
                    index={index}
                    connected={connected}
                    destroy={destroy.bind(null, setElements, id)}
                    {...props}
                />
            )),
        [elements]
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
     * declares the order at which it should be rendered
     */
    index: number
    /**
     * function to end own existance
     */
    destroy: () => void
}

export type VirtualControl<T> = [set: (index: number, props: T) => void, unset: () => void]

export function useVirtualControl<T>(
    component: ComponentType<Partial<T> & VirtualProps>,
    id?: string
): VirtualControl<T> {
    const ctx = useContext(virtualBaseContext)
    const result = useMemo<VirtualControl<T>>(() => {
        const identifier = id ?? uuid()
        return [ctx.set.bind(null, identifier, component), ctx.unset.bind(null, identifier)]
    }, [ctx, id, component])
    useEffect(() => result[1], [result])
    return result
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
    const [set] = useVirtualControl(component, id)
    useEffect(() => {
        set(index ?? 0, props)
    }, [set, index, props])
}
