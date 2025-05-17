"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    app.useGlobalPipes(new validation_pipe_1.ValidationPipe());
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map