export const isDevOrTest = () =>
    process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development";