
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([5, 2, 6, 7, 3, 2, 6])
        }, 1000)
    })
}

export default fetchData