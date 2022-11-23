export class AggregateHelper {
    static populateData(
        aggregate: any[],
        from: string,
        localField: string,
        foreignField: string,
        as: string,
        path: string,
        preserveNullAndEmptyArrays: boolean,
    ) {
        aggregate.push({
            $lookup: {
                from: from,
                localField: localField,
                foreignField: foreignField,
                as: as,
            },
        });
        aggregate.push({
            $unwind: {
                path: path,
                preserveNullAndEmptyArrays: preserveNullAndEmptyArrays,
            },
        });
    }

    static populateUser(aggregate: any[]) {
        this.populateData(
            aggregate,
            'users',
            'user',
            '_id',
            'user',
            '$user',
            true,
        );
    }
    static populatePost(aggregate: any[]) {
        this.populateData(
            aggregate,
            'posts',
            'post',
            '_id',
            'post',
            '$post',
            true,
        );
    }
}