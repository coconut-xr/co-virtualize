# co-virtualize

[![Build Status](https://img.shields.io/github/workflow/status/cocoss-org/co-virtualize/Depolyment)](https://github.com/cocoss-org/co-virtualize/actions)&nbsp;
[![Npm package version](https://badgen.net/npm/v/co-virtualize)](https://npmjs.com/package/co-virtualize)&nbsp;
[![GitHub license](https://img.shields.io/github/license/cocoss-org/co-virtualize.svg)](https://github.com/cocoss-org/co-virtualize/blob/master/LICENSE)&nbsp;
[![Twitter](https://badgen.net/badge/icon/twitter?icon=twitter&label)](https://twitter.com/BelaBohlender)

A React library to enable the extension and decoupling of a component's lifetime.

`npm i co-virtualize`

## **Why?**

A react component and its animation should live inside that component. This library tries to give components control over their existance and let's them animate themself in a consistent way. For example, let component's transitions from life, to death or from death to life smoothly and consistently.

![](./list.gif)
_[List Example](https://cocoss-org.github.io/co-virtualize/list)_

Virtualization of components allows to let the virtualized component live after its originator has been killed. A new owner can also regain control of the virtual component to enable all sorts of fancy animations.

## **How?**

We use the `useVirtual` hook to create a virtual component. The hook takes a component, which should be virtualized and properties for this component and will create an instance of this component as a virtual component. A `VirtualBase` serves as the origin for all virtual components and offers the required functionality for virtualization.  
A virtualized component has, aside from the passed properties, a `destroy` function as properties.  
The `destroy` function enables the component to end its own existence.  
The provided properties are passed to the virtual component in an array called `controllerProps`. The component the invokes `useVirtual` is sean as the controller.
As seen in the [Transition Example](https://cocoss-org.github.io/co-virtualize/transition), a virtual component can have multiple controllers.
When the controller is destroyed, its properties are removed from the `controllerProps`. However, the virtual component will live on, until it calls `destroy` itself.  
Therefore a virtual component's lifetime is **decoupled** from its controllers.

## [Examples](https://cocoss-org.github.io/co-virtualize/)

-   [List](https://cocoss-org.github.io/co-virtualize/list) - Tutorial for a filtered list that animates the creation and destruction of its ListItems
-   [Transition](https://cocoss-org.github.io/co-virtualize/transition) - Use multiple controllers for one virtual component
