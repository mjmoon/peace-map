# pylint: disable=C0103,E1101
''' explore gpi data '''
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib

%matplotlib inline

gpi = pd.read_csv('data/gpi_detail_2008_2018.csv')
gpi.Year.describe()
gpi2018 = gpi[gpi.Year == 2018]
# gpi2018.Score
sns.distplot(gpi2018.Score.apply(lambda x: np.floor_divide(x, 0.5)*0.5), kde=False, norm_hist=False);
