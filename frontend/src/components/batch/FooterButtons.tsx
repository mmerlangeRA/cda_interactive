export const FooterButtons = ({ step, onNext, onBack }: { step: string; onNext: () => void; onBack: () => void }) => (
    <div>
        {step !== "select" && <button onClick={onBack}>Back</button>}
        <button onClick={onNext}>{step === "upload" ? "Close" : "Next"}</button>
    </div>
);
