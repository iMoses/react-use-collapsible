import { render, screen, act, fireEvent } from '@testing-library/react';
import {ContentProps, useCollapsible, UseCollapsibleOptions} from '../index';
import { vi, describe, it, expect, beforeEach } from 'vitest';

function TestComponent(props: UseCollapsibleOptions) {
    const { isOpen, shouldRender, getTriggerProps, getContentProps } =
        useCollapsible<HTMLDivElement, HTMLButtonElement>(props);

    return (
        <div>
            <button {...getTriggerProps()} data-testid="trigger">
                Toggle
            </button>
            <div {...getContentProps()} data-testid="content">
                {shouldRender && <p>Content</p>}
            </div>
            <span data-testid="is-open">{String(isOpen)}</span>
            <span data-testid="should-render">{String(shouldRender)}</span>
        </div>
    );
}

beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        cb(0);
        return 0;
    });

    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        configurable: true,
        get() {
            return 100;
        },
    });
});

describe('useCollapsible', () => {
    it('renders closed by default', () => {
        render(<TestComponent />);
        expect(screen.getByTestId('is-open')).toHaveTextContent('false');
        expect(screen.getByTestId('should-render')).toHaveTextContent('false');
    });

    it('renders open when open=true', () => {
        render(<TestComponent open />);
        expect(screen.getByTestId('is-open')).toHaveTextContent('true');
        expect(screen.getByTestId('should-render')).toHaveTextContent('true');
    });

    it('getTriggerProps returns ref and onClick', () => {
        let triggerProps: ReturnType<
            ReturnType<typeof useCollapsible>['getTriggerProps']
        >;

        function Probe() {
            const result = useCollapsible<HTMLDivElement, HTMLButtonElement>();
            triggerProps = result.getTriggerProps();
            return <div {...result.getContentProps()} />;
        }

        render(<Probe />);
        expect(triggerProps!).toHaveProperty('ref');
        expect(triggerProps!).toHaveProperty('onClick');
        expect(typeof triggerProps!.onClick).toBe('function');
    });

    it('getContentProps returns ref and onTransitionEnd', () => {
        let contentProps: ContentProps<HTMLDivElement>;

        function Probe() {
            const result = useCollapsible<HTMLDivElement, HTMLButtonElement>();
            contentProps = result.getContentProps();
            return <div {...contentProps} />;
        }

        render(<Probe />);
        expect(contentProps!).toHaveProperty('ref');
        expect(contentProps!).toHaveProperty('onTransitionEnd');
        expect(typeof contentProps!.onTransitionEnd).toBe('function');
    });

    it('toggles open on trigger click', () => {
        render(<TestComponent />);

        act(() => {
            fireEvent.click(screen.getByTestId('trigger'));
        });

        expect(screen.getByTestId('is-open')).toHaveTextContent('true');
    });

    it('does not toggle when disabled', () => {
        render(<TestComponent disabled />);

        act(() => {
            fireEvent.click(screen.getByTestId('trigger'));
        });

        expect(screen.getByTestId('is-open')).toHaveTextContent('false');
    });

    it('calls onToggle callback', () => {
        const onToggle = vi.fn();
        render(<TestComponent onToggle={onToggle} />);

        act(() => {
            fireEvent.click(screen.getByTestId('trigger'));
        });

        expect(onToggle).toHaveBeenCalledWith(true, expect.anything());
    });

    it('calls onOpening when opening', () => {
        const onOpening = vi.fn();
        render(<TestComponent onOpening={onOpening} />);

        act(() => {
            fireEvent.click(screen.getByTestId('trigger'));
        });

        expect(onOpening).toHaveBeenCalledOnce();
    });

    it('calls onClosing when closing', () => {
        const onClosing = vi.fn();
        render(<TestComponent open onClosing={onClosing} />);

        // First need to trigger close — the component starts open,
        // so clicking toggles to close
        act(() => {
            fireEvent.click(screen.getByTestId('trigger'));
        });

        expect(onClosing).toHaveBeenCalledOnce();
    });

    it('calls onOpen after opening transition ends', () => {
        const onOpen = vi.fn();
        render(<TestComponent onOpen={onOpen} />);

        act(() => {
            fireEvent.click(screen.getByTestId('trigger'));
        });

        act(() => {
            fireEvent.transitionEnd(screen.getByTestId('content'));
        });

        expect(onOpen).toHaveBeenCalledOnce();
    });

    it('calls onClose after closing transition ends', () => {
        const onClose = vi.fn();
        render(<TestComponent open onClose={onClose} />);

        act(() => {
            fireEvent.click(screen.getByTestId('trigger'));
        });

        act(() => {
            fireEvent.transitionEnd(screen.getByTestId('content'));
        });

        expect(onClose).toHaveBeenCalledOnce();
    });

    it('shouldRender stays true after first open', () => {
        render(<TestComponent />);

        // Initially false
        expect(screen.getByTestId('should-render')).toHaveTextContent('false');

        // Open
        act(() => {
            fireEvent.click(screen.getByTestId('trigger'));
        });
        expect(screen.getByTestId('should-render')).toHaveTextContent('true');

        // Complete transition and close
        act(() => {
            fireEvent.transitionEnd(screen.getByTestId('content'));
        });
        act(() => {
            fireEvent.click(screen.getByTestId('trigger'));
        });

        // shouldRender stays true even when closed
        expect(screen.getByTestId('is-open')).toHaveTextContent('false');
        expect(screen.getByTestId('should-render')).toHaveTextContent('true');
    });

    it('works in controlled mode', () => {
        render(<TestComponent controlled />);
        expect(screen.getByTestId('is-open')).toHaveTextContent('false');

        // In controlled mode, the trigger click still toggles state
        act(() => {
            fireEvent.click(screen.getByTestId('trigger'));
        });

        expect(screen.getByTestId('is-open')).toHaveTextContent('true');
    });

    it('accepts a duration tuple', () => {
        // Should not throw
        render(<TestComponent duration={[300, 200]} />);

        act(() => {
            fireEvent.click(screen.getByTestId('trigger'));
        });

        expect(screen.getByTestId('is-open')).toHaveTextContent('true');
    });
});
