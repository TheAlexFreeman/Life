const lifeUri = 'api/Patterns';

function apiGetAllPatterns() {
    return _apiFetch(lifeUri);
}

function apiLoadPattern(id) {
    return _apiFetch(`${lifeUri}/${id}`);
}

function apiSavePattern(name, creator, points) {
    const body = JSON.stringify({ id: 0, name, creator, points });
    return _apiFetch(`${lifeUri}/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: body
    });

}

function _apiFetch(...params) {
    return fetch(...params).then(response => response.json());
}