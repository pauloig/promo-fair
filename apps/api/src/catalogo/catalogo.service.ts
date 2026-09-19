import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { BuscarCatalogoDto } from "./dto/buscar-catalogo.dto.js";
import type { CatalogoItemDto } from "./dto/catalogo-item.dto.js";
import { toCatalogoItemDto } from "./dto/catalogo-item.dto.js";

const MARCA_DIACRITICOS = /[\u0300-\u036f]/g;

@Injectable()
export class CatalogoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar({ buscar }: BuscarCatalogoDto): Promise<CatalogoItemDto[]> {
    const items = await this.prisma.catalogoItem.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });

    const termino = buscar ? this.normalizar(buscar) : "";
    const visibles = termino
      ? items.filter((item) => this.normalizar(item.nombre).includes(termino))
      : items;

    return visibles.map(toCatalogoItemDto);
  }

  private normalizar(texto: string): string {
    return texto.trim().toLowerCase().normalize("NFD").replace(MARCA_DIACRITICOS, "");
  }
}