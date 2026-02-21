import React from 'react';
import {
    CheckCircle2, Circle, Clock, CreditCard,
    User, FileText, Smartphone, ShieldCheck, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SetupTracker = ({ status }) => {
    if (!status) return null;

    const { stages, completion, nextStep } = status;

    const getIcon = (id, completed) => {
        if (completed) return <CheckCircle2 className="w-5 h-5 text-success-500" />;

        switch (id) {
            case 'profile': return <User className="w-5 h-5" />;
            case 'registration': return <FileText className="w-5 h-5" />;
            case 'membership': return <CreditCard className="w-5 h-5" />;
            case 'activation': return <ShieldCheck className="w-5 h-5" />;
            default: return <Circle className="w-5 h-5" />;
        }
    };

    const getNextStepAction = () => {
        switch (nextStep) {
            case 'COMPLETE_PROFILE':
                return { label: 'Complete Profile', to: '/onboarding/setup', color: 'bg-primary-500' };
            case 'SELECT_PLAN':
                return { label: 'Membership Plan', to: '/membership', color: 'bg-accent-500' };
            case 'COMPLETE_PAYMENT':
                return { label: 'Activate Membership', to: '/onboarding/setup', color: 'bg-warning-500' };
            case 'WAITING_FOR_APPROVAL':
                return { label: 'Awaiting Admin Activation', disabled: true, color: 'bg-surface-400' };
            default:
                return { label: 'Explore Dashboard', to: '/dashboard', color: 'bg-success-500' };
        }
    };

    const action = getNextStepAction();

    return (
        <div className="bg-white dark:bg-surface-800/50 rounded-[2.5rem] border border-surface-200 dark:border-surface-700/50 overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-8 border-b border-surface-100 dark:border-surface-700/50">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">Setup Progress</p>
                        <h2 className="text-2xl font-black mt-1">Activate Club Access</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-black text-primary-500">{completion}%</p>
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Complete</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden p-0.5 relative">
                    <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                        style={{ width: `${completion}%` }}
                    />
                </div>
            </div>

            {/* stages */}
            <div className="p-4 space-y-1">
                {stages.map((stage, idx) => (
                    <div
                        key={stage.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${stage.completed
                            ? 'bg-success-500/5 opacity-60'
                            : 'bg-surface-50 dark:bg-surface-800/30'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stage.completed ? 'bg-success-500/10 text-success-500' : 'bg-white dark:bg-surface-800 text-surface-400 shadow-sm'
                            }`}>
                            {getIcon(stage.id, stage.completed)}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-black uppercase tracking-tight ${stage.completed ? 'text-success-700 dark:text-success-300' : 'text-surface-700 dark:text-surface-200'}`}>
                                {stage.title}
                            </p>
                            <p className="text-[10px] font-bold text-surface-400 uppercase mt-0.5">{stage.description}</p>
                        </div>
                        {stage.completed ? (
                            <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center scale-75">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                        ) : (idx === stages.findIndex(s => !s.completed)) && (
                            <span className="text-[10px] font-black text-primary-500 animate-pulse uppercase tracking-widest">Current</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer Action */}
            <div className="p-6 bg-surface-50 dark:bg-surface-800/80">
                {action.disabled ? (
                    <div className="w-full py-4 text-center text-surface-400 font-black uppercase text-sm flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4 animate-spin-slow" />
                        {action.label}
                    </div>
                ) : (
                    <Link
                        to={action.to}
                        className={`w-full py-4 ${action.color} text-white rounded-2xl font-black uppercase tracking-widest text-sm
                            flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg`}
                    >
                        {action.label}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                )}
            </div>
        </div>
    );
};

export default SetupTracker;
