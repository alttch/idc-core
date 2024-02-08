import { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import { calculateFormula } from "bmat/numbers";

const ErrorBar = ({
    message,
    className,
}: {
    message: string | null;
    className?: string;
}) => {
    return <div className={className || "form-error"}>{message}</div>;
};

export const EditFormula = ({
    element_id,
    update_key,
    current_value = "",
    width,
    setParam,
    errorClassName,
}: {
    element_id: string;
    update_key?: any;
    width?: number;
    current_value: string;
    setParam: (a: string) => void;
    params?: { size?: number };
    errorClassName?: string;
}): JSX.Element => {
    const [input_value, setInputValue] = useState(current_value);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        setInputValue(current_value);
    }, [element_id, update_key]);

    return (
        <div style={{ width: "100%" }}>
            <TextField
                sx={{ padding: "8px", width: width }}
                fullWidth
                type="text"
                value={input_value}
                onChange={(e) => {
                    try {
                        const val = e.target.value;
                        setInputValue(val);
                        calculateFormula(val, 1);
                        setParam(val);
                        setErrorMessage(null);
                    } catch (e: any) {
                        setErrorMessage(e.toString());
                    }
                }}
            />
            {errorMessage && (
                <ErrorBar message={errorMessage} className={errorClassName} />
            )}
        </div>
    );
};
