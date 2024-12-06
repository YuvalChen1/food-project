export type ToppingType = {
  id: number;
  name: string;
  image: string;
  price: number;
  renderType: 'scattered' | 'layer';
  layerImage?: string;
  zIndex: number;
  renderImage?: string;
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
    image: '/toppings/mushrooms_pick.png',
    renderImage: '/toppings/mushroom_topping.png',
    price: 1,
    renderType: 'scattered',
    zIndex: 20
  },
  {
    id: 4,
    name: 'Onions',
    image: '/toppings/onions.png',
    renderImage: '/toppings/onion_topping.png',
    price: 0.75,
    renderType: 'scattered',
    zIndex: 20
  },
  {
    id: 5,
    name: 'Tomatoes',
    image: '/toppings/tomatoes.png',
    renderImage: '/toppings/tomato_topping.png',
    price: 0.75,
    renderType: 'scattered',
    zIndex: 20
  },
  {
    id: 6,
    name: 'Black olives',
    image: '/toppings/olives.png',
    renderImage: '/toppings/olive_topping.png',
    price: 1,
    renderType: 'scattered',
    zIndex: 20
  },
  {
    id: 7,
    name: 'Green peppers',
    image: '/toppings/green-peppers.png',
    renderImage: '/toppings/pepper_topping.png',
    price: 0.75,
    renderType: 'scattered',
    zIndex: 20
  }
]; 