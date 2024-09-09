export const getBackendHost = () => {
    if (typeof window === 'undefined') {
        // Server-side
        
        return process.env.NEXT_PUBLIC_SERVER_SIDE_BACKEND_HOST;
    } else {
        // Client-side
        return process.env.NEXT_PUBLIC_CLIENT_SIDE_BACKEND_HOST;
    }
}

export const getBackendUrl = () => {
    const backendHost = getBackendHost()
    if (backendHost.includes("https")) {
        return backendHost
    }
    return `http://${backendHost}:${process.env.NEXT_PUBLIC_BACKEND_PORT}`
}


export const getClientSideBackendUrl = () => {
    if (process.env.NEXT_PUBLIC_CLIENT_SIDE_BACKEND_HOST.includes("https")) {
        return process.env.NEXT_PUBLIC_CLIENT_SIDE_BACKEND_HOST

    } 
    return `http://${process.env.NEXT_PUBLIC_CLIENT_SIDE_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}`
}