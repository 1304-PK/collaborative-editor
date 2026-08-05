const errorFormatter = (result) => {
    return result.error.issues[0].message
}

export default errorFormatter