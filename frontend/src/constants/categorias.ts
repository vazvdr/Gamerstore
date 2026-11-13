
export interface Categoria {
  nome: string;
  slug: string;
  tags: string[];
}

export const categorias: Categoria[] = [
  {
    nome: 'Notebooks',
    slug: 'notebooks',
    tags: ['notebook'],
  },
  {
    nome: 'Processadores',
    slug: 'processadores',
    tags: ['processador'],
  },
  {
    nome: 'Periféricos',
    slug: 'perifericos',
    tags: ['teclado', 'mouse'],
  },
  {
    nome: 'Áudio',
    slug: 'audio',
    tags: ['headset'],
  },
  {
    nome: 'Monitores',
    slug: 'monitores',
    tags: ['monitor'],
  },
  {
    nome: 'Placas de Vídeo',
    slug: 'placas de video',
    tags: ['placa de video'],
  },
  {
    nome: 'Placas Mãe',
    slug: 'placas mae',
    tags: ['placa mae'],
  },
  {
    nome: 'Memória RAM',
    slug: 'memoria ram',
    tags: ['memoria ram'],
  },
  {
    nome: 'Video Games',
    slug: 'video games',
    tags: ['console'],
  },
];