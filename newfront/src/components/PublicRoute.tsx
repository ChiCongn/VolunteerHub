import { Navigate } from "react-router-dom";
import React from "react";

export default function PublicRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const token = localStorage.getItem("token");

    // Nếu đã login → không cho vào trang login/register nữa
    if (token) {
        return <Navigate to="/" replace />;
    }

    return children;
}
