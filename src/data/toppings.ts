export type ToppingType = {
  id: number;
  name: string;
  image: string;
  price: number;
  renderType: 'scattered' | 'layer';
  layerImage?: string;
  zIndex: number;
};

export const toppings: ToppingType[] = [
  {
    id: 1,
    name: 'Extra cheese',
    image: '/toppings/cheese.png',
    price: 1,
    renderType: 'scattered',
    zIndex: 10
  },
  {
    id: 2,
    name: 'Pepperoni',
    image: '/toppings/pepperoni.png',
    price: 1.5,
    renderType: 'scattered',
    zIndex: 20
  },
  {
    id: 3,
    name: 'Mushrooms',
    image: '/toppings/mushrooms.png',
    price: 1,
    renderType: 'scattered',
    zIndex: 20
  },
  {
    id: 4,
    name: 'Onions',
    image: '/toppings/onions.png',
    price: 0.75,
    renderType: 'scattered',
    zIndex: 20
  },
  {
    id: 5,
    name: 'Sausage',
    image: '/toppings/sausage.png',
    price: 1.5,
    renderType: 'scattered',
    zIndex: 20
  },
  {
    id: 6,
    name: 'Bacon',
    image: '/toppings/bacon.png',
    price: 1.5,
    renderType: 'scattered',
    zIndex: 20
  },
  {
    id: 7,
    name: 'Black olives',
    image: '/toppings/olives.png',
    price: 1,
    renderType: 'scattered',
    zIndex: 20
  },
  {
    id: 8,
    name: 'Green peppers',
    image: '/toppings/green-peppers.png',
    price: 0.75,
    renderType: 'scattered',
    zIndex: 20
  }
]; 