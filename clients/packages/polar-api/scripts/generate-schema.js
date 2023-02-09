const axios = require('axios')
const fs = require('fs')

const OVERRIDE_MAPPING = {
    'users:users:current_user': 'get_authenticated',
    'users:users:patch_current_user': 'update_authenticated',
    'users:users:user': 'get',
    'users:users:delete_user': 'delete',
    'users:users:patch_user': 'update',
    'integrations:oauth:github.jwt.authorize': 'github_authorize',
    'integrations:oauth:github.jwt.callback': 'github_callback',
}

let consumedOperationIds = {}

const ensureUnique = (operationId) => {
    /*
    * Let's avoid silently overwriting API methods due to name collisions.
    * Instead we ensure we throw an error here during generation.
    */
    if (operationId in consumedOperationIds) {
        throw new Error(`OperationId ${operationId} is not unique`)
    }
    return true
}

const createOperationId = (currentOperationId) => {
    // Hardcoded overrides, e.g FastAPI names from dependencies (FastAPI Users)
    if (currentOperationId in OVERRIDE_MAPPING) {
        return OVERRIDE_MAPPING[currentOperationId]
    }

    // FastAPI route names from our own code
    let parts = currentOperationId.split(':')
    return parts[parts.length - 1]
}

const convert = (schema) => {
    let newOperationId, currentOperationId
    for (const [key, value] of Object.entries(schema.paths)) {
        for (const [method, schema] of Object.entries(value)) {
            currentOperationId = schema.operationId
            newOperationId = createOperationId(currentOperationId)
            ensureUnique(newOperationId)
            console.log(`${key} -> ${currentOperationId} -> (${schema.tags[0]}.)${newOperationId}`)
            schema.operationId = newOperationId
        }
    }
}

const getOpenAPISchema = async (schemaUrl) => {
    const schema = await axios.get(schemaUrl).then((response) => {
        return response.data
    })
    return schema
}

const save = (filename, schema) => {
    const asJson = JSON.stringify(schema, null, 4)
    const written = fs.writeFileSync(filename, asJson)
    return written
}


const main = async (schemaUrl, sourceFilename, generatedFilename) => {
    const schema = await getOpenAPISchema(schemaUrl)
    save(sourceFilename, schema)
    convert(schema)
    save(generatedFilename, schema)
}

const argv = process.argv.slice(2)
if (argv.length !== 3) {
    throw new Error('Args: <remoteSchemaUrl> <saveOriginalAs> <saveUpdatedAs>')
}
main(argv[0], argv[1], argv[2])