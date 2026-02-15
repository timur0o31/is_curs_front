import Api from "../config/Api.js";

export async function login(payload) {
    const response = await fetch(Api.BASE_URL + Api.ENDPOINTS.AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        throw new Error('Неверный логин или пароль')
    }

    return response.json()
}