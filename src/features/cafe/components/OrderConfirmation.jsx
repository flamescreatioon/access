import { Copy, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

export default function OrderConfirmation({ order, onReset }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(order.order_reference);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-surface-800/80 rounded-[2.5rem] p-8 border border-surface-200 dark:border-surface-700/50 shadow-2xl relative text-center">
            <button
                onClick={onReset}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 transition-colors"
                title="Close"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 bg-warning-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-warning-500" />
            </div>

            <h2 className="text-2xl font-black mb-2">Order Placed!</h2>
            <p className="text-sm font-medium text-surface-500 mb-8">
                Your order has been recorded. It is currently <span className="font-bold">Pending Payment</span>.
            </p>

            <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-700/50 mb-8">
                <p className="uppercase tracking-widest text-[10px] font-black text-surface-400 mb-2">Order Reference</p>
                <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-black text-primary-600 dark:text-primary-400 select-all">
                        {order.order_reference}
                    </span>
                    <button
                        onClick={handleCopy}
                        className="p-2 transition-all rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800"
                        title="Copy Reference"
                    >
                        {copied ? (
                            <CheckCircle2 className="w-5 h-5 text-success-500" />
                        ) : (
                            <Copy className="w-5 h-5 text-surface-400" />
                        )}
                    </button>
                </div>
            </div>

            <div className="bg-primary-500/10 border-2 border-dashed border-primary-500/20 rounded-2xl p-6 text-left mb-8">
                <h3 className="font-black text-primary-600 dark:text-primary-400 flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                    Next Steps
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-300 font-medium">
                    Please contact the Unipod Admin to complete payment. Use your <strong className="text-primary-500">Order Reference ID</strong> when making payment. Wait for the admin to confirm your payment before the order is prepared.
                </p>
                <div className="mt-4 pt-4 border-t border-primary-500/10 flex justify-between items-center text-xs font-black">
                    <span className="text-surface-500">Total Due</span>
                    <span className="text-lg text-primary-600 dark:text-primary-400">₦{parseFloat(order.total_amount).toLocaleString()}</span>
                </div>
            </div>

            <button
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-surface-200 dark:hover:bg-surface-700 transition-all"
            >
                View Menu <ChevronRight className="w-4 h-4 text-surface-400" />
            </button>
        </div>
    );
}
