import numpy as np
import pandas as pd


# Importing dataset
dataset= pd.read_csv('datasets/Data.csv')
X=dataset.iloc[:,:-1].values
Y=dataset.iloc[:,3].values

print(dataset)
print(X)
print('Y:',Y)


