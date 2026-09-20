import { Global, Module } from "@nestjs/common";
import { CsrfController } from "./csrf.controller.js";
import { CsrfGuard } from "./csrf.guard.js";

@Global()
@Module({
  controllers: [CsrfController],
  providers: [CsrfGuard],
  exports: [CsrfGuard],
})
export class CsrfModule {}