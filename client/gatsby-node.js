const path = require(`path`)

exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions;
    const result = await graphql(`
        query {
            lolly {
                getLollies {
                    id
                }
            }
        }
    `)

    result.data.lolly.getLollies.map(dt => {
        createPage({
            path : `lolly/${dt.id}`,
            component: path.resolve(`./src/templates/invoice.tsx`),
            context: {
                id: dt.id,
            },
        })
    })
}