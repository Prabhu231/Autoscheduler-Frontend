import { api } from "./api";


const checkStatus = async () => {
    try {
        await api.get('/check/')
    } catch {
        window.location.href = '/auth/login'
    }
}

export default checkStatus