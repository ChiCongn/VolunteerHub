export const getPasswordStrength = (password: string) => {
    if (!password) {
        return { strength: 0, label: "", color: "bg-gray-300" };
    }

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasMinLength = password.length >= 8;

    const passedRules = [
        hasMinLength,
        hasLower,
        hasUpper,
        hasNumber,
        hasSpecial,
    ].filter(Boolean).length;

    const strength = (passedRules / 5) * 100;

    if (strength < 40) {
        return { strength, label: "Weak", color: "bg-[#F44336]" };
    }

    if (strength < 80) {
        return { strength, label: "Fair", color: "bg-[#FFC107]" };
    }

    if (hasMinLength && hasLower && hasUpper && hasNumber && hasSpecial) {
        return { strength: 100, label: "Good", color: "bg-[#43A047]" };
    }

    return { strength, label: "Fair", color: "bg-[#FFC107]" };
};
