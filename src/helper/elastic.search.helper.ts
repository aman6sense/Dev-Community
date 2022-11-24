import { Client } from '@opensearch-project/opensearch';
const host = 'localhost:9200';
const protocol = 'https';
const url = protocol + '://' + host;
const client = new Client({
    node: url,
    auth: {
        username: 'admin',
        password: 'admin',
    },
    ssl: {
        rejectUnauthorized: false,
    },
});

export enum IndexNames {
    users = 'users',
    experiences = 'experiences',
    skills = 'skills',
    posts = 'posts',
    comments = 'comments'
}

const dummyResponse = {
    "took": 0,
    "timed_out": false,
    "_shards": {
        "total": 0,
        "successful": 0,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": {
            "value": 0,
            "relation": "eq"
        },
        "max_score": 0,
        "hits": []
    }
}

export class ElasticSearchHelper {

    static async remove(id: string, indexName: IndexNames) {
        const remove = await client.delete(
            {
                id: id,
                index: `${indexName}`,
            }
        )
        return remove;
    }

    static async index(indexName: IndexNames, object: any) {
        const id = object['_id'].toString()
        object['id'] = object['_id']
        delete object._id
        try {

            const response = await client.index({
                id: id,
                index: `${indexName}`,
                body: object,
                refresh: true,
            });
            return response;
        } catch (error) {
            console.log(error)
        }
    }

    static async search(indexName: IndexNames, query: any): Promise<any> {
        try {
            const response = await client.search({
                index: `${indexName}`,
                body: query,
                filter_path: ['hits.hits._source']
            });

            return response;
        } catch (e) {
            console.log(e)
            return {
                body: dummyResponse
            }
        }
    }

    static getFixedQueryString(search: string) {
        let queryStr = "";
        const escaperules = [
            '+',
            // '-',
            '&',
            '|',
            '!',
            '(',
            ')',
            '{',
            '}',
            '[',
            ']',
            '^',
            '~',
            '*',
            '?',
            ':',
            '"',
            "@",
            "#",
            "$",
        ]

        for (let i = 0; i < escaperules.length; i++) {

            queryStr = search.replaceAll(escaperules[i], `\\${escaperules[i]}`)

            // queryStr = search.split(escaperules[i]).join(`\\${escaperules[i]}`)
        }

        if (search.includes(" ") || search.includes("-")) {
            queryStr = `\"${search.split(" ").join("*").split("-").join("*")}*\"`
        } else {
            queryStr = `${search}*`
        }

        return queryStr
    }

}
