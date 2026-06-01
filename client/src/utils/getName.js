const getName = (email) => {
    if (!email) return null

    const name = email.split('@')[0].replaceAll('.', '')
    return name[0].toUpperCase() + name.slice(1)
}

export default getName