import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { useMotionPreference } from '@/contexts/MotionPreferenceContext';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}) {
    const { reduceMotion } = useMotionPreference();
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    return (
        <Transition show={show} leave={reduceMotion ? 'duration-0' : 'duration-200'}>
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 z-50 flex transform items-center overflow-y-auto px-4 py-6 transition-all sm:px-0"
                onClose={close}
            >
                <TransitionChild
                    enter={reduceMotion ? 'duration-0' : 'ease-out duration-300'}
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave={reduceMotion ? 'duration-0' : 'ease-in duration-200'}
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
                </TransitionChild>

                <TransitionChild
                    enter={reduceMotion ? 'duration-0' : 'ease-out duration-300'}
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave={reduceMotion ? 'duration-0' : 'ease-in duration-200'}
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel
                        className={`mb-6 mx-auto w-full transform overflow-hidden rounded-2xl transition-all ${maxWidthClass}`}
                        style={{ background: 'transparent' }}
                    >
                        {children}
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
