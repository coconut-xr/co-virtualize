import React, { ComponentType, createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { v4 as uuid } from "uuid"

type VirtualBaseContext = {
    set: (id: string, controllerId: string, component: ComponentType<any>, index: number, props: any) => void
    unset: (id: string, controllerId: string) => void
}

const virtualBaseContext = createContext<VirtualBaseContext>(null as any)

type VirtualElements = Array<VirtualElement>

type VirtualElement = {
    id: string
    index: number
    component: ComponentType<VirtualProps<any>>
    controllerPropsList: Array<{ id: string; value: any }>
    controllerProps: Array<any>
}

/**
 * remove virtual element, can only be executed by the virtual component itself
 */
function destroy(setElements: (fn: (elements: VirtualElements) => VirtualElements) => void, destroyId: string): void {
    setElements((elements) => elements.filter(({ id }) => id != destroyId).sort((e1, e2) => e1.index - e2.index))
}

/**
 * remove controller prop from virtual element
 */
function unset(
    setElements: (fn: (elements: VirtualElements) => VirtualElements) => void,
    id: string,
    controllerId: string
): void {
    setElements((elements) =>
        elements.map((element) => {
            if (element.id === id) {
                const controllerPropsList = element.controllerPropsList.filter((prop) => prop.id != controllerId)
                return {
                    ...element,
                    controllerPropsList,
                    controllerProps: controllerPropsList.map(({ value }) => value),
                }
            }
            return element
        })
    )
}

/**
 * add or edit virtual elements
 */
function set(
    setElements: (fn: (elements: VirtualElements) => VirtualElements) => void,
    id: string,
    controllerId: string,
    component: ComponentType<any>,
    index: number,
    prop: any
): void {
    setElements((elements) => {
        const result = [...elements]
        let insertIndex = result.findIndex((element) => {
            if (element.id == id) {
                if (element.index != index && element.controllerPropsList.length > 0) {
                    throw `multiple controllers can't assign unequal indices to the same virtual element (id "${id}")`
                }
                if (element.component != component) {
                    throw `can't change the component of an exisiting element (id "${id}")`
                }
                return true
            }
            return false
        })
        let controllerPropsList: VirtualElement["controllerPropsList"]
        let controllerPropsListInsertIndex: number

        if (insertIndex === -1) {
            insertIndex = result.length
            controllerPropsList = []
            controllerPropsListInsertIndex = 0
        } else {
            controllerPropsList = [...result[insertIndex].controllerPropsList]
            controllerPropsListInsertIndex = controllerPropsList.findIndex((prop) => prop.id === controllerId)
            if (controllerPropsListInsertIndex === -1) {
                controllerPropsListInsertIndex = controllerPropsList.length
            }
        }

        controllerPropsList[controllerPropsListInsertIndex] = { id: controllerId, value: prop }
        result[insertIndex] = {
            id,
            component,
            index,
            controllerPropsList,
            controllerProps: controllerPropsList.map(({ value }) => value),
        }
        return result.sort((e1, e2) => e1.index - e2.index)
    })
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
            elements.map(({ component: C, id, controllerProps, index }) => (
                <C
                    key={id}
                    id={id}
                    index={index}
                    controllerProps={controllerProps}
                    destroy={destroy.bind(null, setElements, id)}
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
export type VirtualProps<T> = {
    id: string
    controllerProps: Array<T>
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

export function useVirtualControl<T>(component: ComponentType<VirtualProps<T>>, id?: string): VirtualControl<T> {
    const ctx = useContext(virtualBaseContext)
    const result = useMemo<VirtualControl<T>>(() => {
        const identifier = id ?? uuid()
        const controllerId = uuid()
        return [ctx.set.bind(null, identifier, controllerId, component), ctx.unset.bind(null, identifier, controllerId)]
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
export function useVirtual<T>(component: ComponentType<VirtualProps<T>>, props: T, index?: number, id?: string): void {
    const [set] = useVirtualControl(component, id)
    useEffect(() => set(index ?? 0, props), [set, index, props])
}
