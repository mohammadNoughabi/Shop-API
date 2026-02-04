export const generateTrackingNumber = (length : number) : number => {
    return Math.floor(Math.random() * Math.pow(10 , length))
}