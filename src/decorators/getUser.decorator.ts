import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/user/schema/user.schema';



export const GetUser = createParamDecorator(

    (data, ctx: ExecutionContext): User => {
        const req = ctx.switchToHttp().getRequest();
        // console.log("getUser: ", req.user);

        return req.user;
    },
);
