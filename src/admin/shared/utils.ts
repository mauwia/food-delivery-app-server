export const isProduction = () => process.env.NODE_ENV === 'production' && !process.env.ON_HEROKU;
