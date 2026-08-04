export interface Actor {
    id: string;
    name: string;
    photoUrl: string;
    knownFor?: string;      // Ex: "aespa", "Cha Eun-woo" ou dorama principal
    rank?: number;          // Ex: 1, 2, 3 (Opcional, usado quando estiver no Top/Hot)
    viewsCount?: number;    // Ex: 14, 12 (Contador de acessos)
    trendUp?: number;       // Ex: +2, +8 (Variação de alta)
}