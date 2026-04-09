import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useState } from 'react';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);
    const toggleOpen = () => setOpen((s) => !s);

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);
    return (
        <>
            <div onClick={toggleOpen}>{children}</div>
            {open && (
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            )}
        </>
    );
};

const Content = ({ align = 'right', width = '48', children }) => {
    const { open, setOpen } = useContext(DropDownContext);

    const alignClass =
        align === 'left'
            ? 'ltr:origin-top-left rtl:origin-top-right start-0'
            : 'ltr:origin-top-right rtl:origin-top-left end-0';

    const widthClass = width === '48' ? 'w-48' : '';

    return (
        <Transition
            show={open}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
        >
            <div
                className={`absolute z-50 mt-2 rounded-xl shadow-lg ${alignClass} ${widthClass}`}
                onClick={() => setOpen(false)}
                style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)',
                }}
            >
                <div className="py-1">{children}</div>
            </div>
        </Transition>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => (
    <Link
        {...props}
        className={className}
        style={{
            display: 'block', width: '100%', padding: '9px 16px',
            fontSize: '13px', fontWeight: 500,
            color: '#6b6458', textDecoration: 'none',
            transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#1c1812'; e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#6b6458'; e.currentTarget.style.background = 'transparent'; }}
    >
        {children}
    </Link>
);

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
