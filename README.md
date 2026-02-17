# @imoses.g/react-use-collapsible

[![CI](https://github.com/iMoses/react-use-collapsible/actions/workflows/ci.yml/badge.svg)](https://github.com/iMoses/react-use-collapsible/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/%40imoses.g%2Freact-use-collapsible)](https://www.npmjs.com/package/@imoses.g/react-use-collapsible)
[![license](https://img.shields.io/npm/l/%40imoses.g%2Freact-use-collapsible)](./LICENSE)

A lightweight, headless React hook for building accessible collapsible/accordion components with smooth height transitions.

## Features

- **Headless** — bring your own markup and styles
- **Smooth height transitions** — animates between `0` and `scrollHeight` with configurable duration & easing
- **Accessible** — works naturally with buttons, ARIA attributes, and keyboard navigation
- **Controlled & uncontrolled** modes
- **Lifecycle callbacks** — `onOpening`, `onOpen`, `onClosing`, `onClose`, `onToggle`
- **Lazy rendering** — `shouldRender` stays `false` until first open, enabling deferred mount
- **Tiny** — zero dependencies, ~1 KB gzipped
- **TypeScript** — fully typed with generic element support

## Installation

```bash
npm install @imoses.g/react-use-collapsible
```

> **Peer dependency:** React 18 or later.

## Quick Start

```tsx
import { useCollapsible } from '@imoses.g/react-use-collapsible';

function Collapsible() {
    const { isOpen, getTriggerProps, getContentProps } = useCollapsible<
        HTMLDivElement,
        HTMLButtonElement
    >();

    return (
        <div>
            <button {...getTriggerProps()}>{isOpen ? 'Hide' : 'Show'}</button>
            <div {...getContentProps()}>
                <p>Collapsible content here.</p>
            </div>
        </div>
    );
}
```

## API

### `useCollapsible<ContentType, TriggerType>(options?)`

#### Options

| Option       | Type                                                  | Default                            | Description                                                         |
| ------------ | ----------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `open`       | `boolean`                                             | `false`                            | Initial open state (uncontrolled) or current state (controlled)     |
| `disabled`   | `boolean`                                             | `false`                            | Prevents toggling when `true`                                       |
| `duration`   | `number \| [number, number]`                          | `400`                              | Transition duration in ms. Tuple sets `[open, close]` independently |
| `easing`     | `string`                                              | `'cubic-bezier(0.45, 0, 0.55, 1)'` | CSS easing function                                                 |
| `overflow`   | `string`                                              | `'hidden'`                         | CSS overflow value applied when open                                |
| `controlled` | `boolean`                                             | `false`                            | Enables controlled mode — toggle via `open` prop changes            |
| `onToggle`   | `(wouldOpen: boolean, event: SyntheticEvent) => void` | —                                  | Called when the trigger is clicked                                  |
| `onOpening`  | `() => void`                                          | —                                  | Called when the opening transition starts                           |
| `onOpen`     | `TransitionEventHandler`                              | —                                  | Called when the opening transition ends                             |
| `onClosing`  | `() => void`                                          | —                                  | Called when the closing transition starts                           |
| `onClose`    | `TransitionEventHandler`                              | —                                  | Called when the closing transition ends                             |

#### Return Value

| Property            | Type                 | Description                                               |
| ------------------- | -------------------- | --------------------------------------------------------- |
| `isOpen`            | `boolean`            | Current open state                                        |
| `shouldRender`      | `boolean`            | `true` once the collapsible has been opened at least once |
| `getTriggerProps()` | `() => TriggerProps` | Spread onto the trigger element                           |
| `getContentProps()` | `() => ContentProps` | Spread onto the content wrapper element                   |

### Type Exports

```ts
import type {
    UseCollapsibleOptions,
    UseCollapsibleOutput,
    TriggerProps,
    ContentProps,
} from '@imoses.g/react-use-collapsible';
```

## Advanced Usage

### Controlled Mode

```tsx
function ControlledCollapsible() {
    const [open, setOpen] = useState(false);
    const { getContentProps } = useCollapsible({
        open,
        controlled: true,
    });

    return (
        <div>
            <button onClick={() => setOpen((o) => !o)}>Toggle</button>
            <div {...getContentProps()}>
                <p>Controlled content.</p>
            </div>
        </div>
    );
}
```

### Custom Duration & Easing

```tsx
const { getTriggerProps, getContentProps } = useCollapsible({
    duration: [300, 200], // 300ms open, 200ms close
    easing: 'ease-in-out',
});
```

### Lifecycle Callbacks

```tsx
const { getTriggerProps, getContentProps } = useCollapsible({
    onOpening: () => console.log('Opening…'),
    onOpen: () => console.log('Fully open'),
    onClosing: () => console.log('Closing…'),
    onClose: () => console.log('Fully closed'),
    onToggle: (wouldOpen, event) =>
        console.log(wouldOpen ? 'Will open' : 'Will close'),
});
```

### Lazy Rendering

```tsx
function LazyCollapsible() {
    const { isOpen, shouldRender, getTriggerProps, getContentProps } =
        useCollapsible<HTMLDivElement, HTMLButtonElement>();

    return (
        <div>
            <button {...getTriggerProps()}>Toggle</button>
            <div {...getContentProps()}>
                {shouldRender && <HeavyComponent />}
            </div>
        </div>
    );
}
```

## License

[MIT](./LICENSE)
