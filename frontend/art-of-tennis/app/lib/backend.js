export const getBackendHost = () => {
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    console.log(process.env.SERVER_SIDE_BACKEND_HOST)
    console.log(process.env.CLIENT_SIDE_BACKEND_HOST)
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    if (typeof window === 'undefined') {
        // Server-side
        
        return process.env.SERVER_SIDE_BACKEND_HOST;
    } else {
        // Client-side
        return process.env.CLIENT_SIDE_BACKEND_HOST;
    }
}

export const getBackendUrl = () => {
    const backendHost = getBackendHost()
    if (backendHost.includes("https")) {
        return backendHost
    }
    return `http://${backendHost}:${process.env.BACKEND_PORT}`
}


export const getClientSideBackendUrl = () => {
    return `http://${process.env.CLIENT_SIDE_BACKEND_HOST}:${process.env.BACKEND_PORT}`
}