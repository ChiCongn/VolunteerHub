import { Navigate } from "react-router-dom";
import React from "react";

export default function PublicRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const token = localStorage.getItem("token");

    if (token) {
        return <Navigate to="/home" replace />;
    }

    return children;
}
