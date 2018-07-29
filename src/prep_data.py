# pylint: disable=C0103
''' prepare gpi data for visualization '''
import json
import numpy as np
import pandas as pd

# read files
gpi = pd.read_csv('data/gpi_detail_2008_2018.csv')
# gpi.columns
# gpi.columns = [x.replace(' ', '_').lower() for x in gpi.columns]

with open('data/countries_50m.geojson', 'r') as file:
    geojson = json.load(file)

tmp = list()
for feat in geojson['features']:
    tmp.append(feat['properties'])

geo = pd.DataFrame(tmp)

# create a key table
gpi_names = gpi['Country'].unique()
geo_names = geo['NAME'].unique()
geo_names_long = geo['NAME_LONG'].unique()

# set(gpi_names).difference(geo_names) & set(gpi_names).difference(geo_names_long)

geo_gpi = pd.concat([
    geo.loc[
        (geo['NAME'].isin(gpi_names))
    ][['GU_A3', 'NAME']],
    geo.loc[
        (geo['NAME_LONG'].isin(gpi_names))& (~geo['NAME'].isin(gpi_names))
    ][['GU_A3', 'NAME_LONG']]
    .rename(columns={'NAME_LONG': 'NAME'})
])

geo_gpi = geo_gpi.append(pd.DataFrame({
    'NAME': list(
        set(gpi_names).difference(geo_names)
        & set(gpi_names).difference(geo_names_long)
    ),
    'GU_A3': [
        geo.loc[['Mace' in x for x in geo_names], 'GU_A3'].item(),
        geo.loc[['Ivo' in x for x in geo_names], 'GU_A3'].item(),
        geo.loc[['Kyr' in x for x in geo_names], 'GU_A3'].item(),
        geo.loc[['Swa' in x for x in geo_names], 'GU_A3'].item()
    ]
}), sort=True, ignore_index=True)

geo_gpi = geo_gpi.merge(
    geo[['GU_A3', 'SUBREGION']],
    how='left',
    on='GU_A3'
)

# merge gpi data
gpi_gu_a3 = pd.merge(
    gpi, geo_gpi,
    how='inner',
    left_on='Country',
    right_on='NAME',
    validate='many_to_one'
)
gpi_gu_a3.drop(['Country', 'NAME'], axis=1, inplace=True)

gpi_mean = gpi_gu_a3.groupby(['Year']).mean().reset_index()
gpi_mean['GU_A3'] = 'AVG'
gpi_mean['Rank'] = -1

gpi_gu_a3 = pd.concat([gpi_gu_a3, gpi_mean]).reset_index().drop(columns='index')
# gpi_gu_a3.groupby('GU_A3').apply(
#     lambda x: x.drop(columns='GU_A3').to_dict(orient='records')
# ).to_json(
#     'plots/data/gpi.json', orient='index', sort=True
# )

gpi_gu_a3.to_csv(
    'plots/data/gpi.csv', index=False
)

# get change in scores
diff_list = list()
for x in range(10):
    diff = x + 1
    df_diff = gpi_gu_a3.groupby('GU_A3').diff(periods=diff)
    df_diff.drop(columns='Year', inplace=True)
    df_diff = pd.concat([gpi_gu_a3[['GU_A3', 'Year']], df_diff], axis=1)
    df_diff = df_diff[df_diff['Year'] > (2008 + x)]
    df_diff['diff'] = diff
    diff_list.append(df_diff)

gpi_diff = pd.concat(diff_list)
gpi_diff.dropna(inplace=True)

details = [x for x in gpi.columns if x not in ['Country', 'Year', 'Rank', 'Score']]
len(details)
details
gpi_diff.describe()
gpi_diff['Score'].min()

# last line
