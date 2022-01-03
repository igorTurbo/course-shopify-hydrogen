import {
  useShopQuery,
  flattenConnection,
  ProductProviderFragment,
  Image,
  Link,
} from '@shopify/hydrogen';
import gql from 'graphql-tag';

import Layout from '../components/Layout.server';
import FeaturedCollection from '../components/home/FeaturedCollection';
import ProductCard from '../components/product/ProductCard';
import Welcome from '../components/home/Welcome.server';

function ProductGrid({productCollection}) {
  const featuredProducts = productCollection
    ? flattenConnection(productCollection.products)
    : null;

  return (
    <div className="p-10 mb-5">
      {productCollection ? (
        <>
          <div className="flex justify-between items-center mb-8 text-xl font-medium">
            <span className="text-black font-bold uppercase w-full md:w-auto text-center">
              {productCollection.title}
            </span>
            <span className="hidden md:inline-flex">
              <Link
                to={`/collections/${productCollection.handle}`}
                className="text-tertiary hover:underline capitalize"
              >
                See all
              </Link>
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="md:hidden text-center">
            <Link
              to={`/collections/${productCollection.handle}`}
              className="text-tertiary capitalize text-xl"
            >
              See all
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function Index({country = {isoCode: 'US'}}) {
  const {data} = useShopQuery({
    query: QUERY,
    variables: {
      country: country.isoCode,
    },
  });

  const collections = data ? flattenConnection(data.collections) : [];
  const featuredProductsCollection = collections[0];
  const secondProductsCollection = collections[1];
  const featuredCollection =
    collections && collections.length > 1 ? collections[1] : collections[0];

  return (
    <Layout hero={<Welcome />}>
      <div className="relative mb-12">
        <ProductGrid productCollection={featuredProductsCollection} />
        <FeaturedCollection collection={featuredCollection} />
        <ProductGrid productCollection={secondProductsCollection} />
      </div>
    </Layout>
  );
}

const QUERY = gql`
  query indexContent(
    $country: CountryCode
    $numCollections: Int = 2
    $numProducts: Int = 3
    $includeReferenceMetafieldDetails: Boolean = false
    $numProductMetafields: Int = 0
    $numProductVariants: Int = 250
    $numProductMedia: Int = 1
    $numProductVariantMetafields: Int = 10
    $numProductVariantSellingPlanAllocations: Int = 0
    $numProductSellingPlanGroups: Int = 0
    $numProductSellingPlans: Int = 0
  ) @inContext(country: $country) {
    collections(first: $numCollections) {
      edges {
        node {
          descriptionHtml
          description
          handle
          id
          title
          image {
            ...ImageFragment
          }
          products(first: $numProducts) {
            edges {
              node {
                ...ProductProviderFragment
              }
            }
          }
        }
      }
    }
  }

  ${ProductProviderFragment}
  ${Image.Fragment}
`;
