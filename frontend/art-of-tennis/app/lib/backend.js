export const getBackendHost = () => {
    if (typeof window === 'undefined') {
        // Server-side
        return process.env.SERVER_SIDE_BACKEND_HOST;
    } else {
        // Client-side
        return process.env.CLIENT_SIDE_BACKEND_HOST;
    }
}

export const getBackendUrl = () => {
    return `http://${getBackendHost()}:${process.env.BACKEND_PORT}`
}


export const getClientSideBackendUrl = () => {
    return `http://${process.env.CLIENT_SIDE_BACKEND_HOST}:${process.env.BACKEND_PORT}`
}