import type { CollectionBeforeChangeHook, CollectionBeforeOperationHook } from 'payload'

export const beforeAuctionTypesOperationHook: CollectionBeforeOperationHook = async ({
    args,
    operation,
    req,
}) => {
        
    return args // return modified operation arguments as necessary
}

export const generateSlugHook: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
    
    return {...data, slug:  data.slug.split(" ").join("_").toLowerCase().replace(/\s+/g, '-')} // Example slug generation}; 
}