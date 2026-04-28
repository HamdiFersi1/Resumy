---
tags:
- sentence-transformers
- sentence-similarity
- feature-extraction
- generated_from_trainer
- dataset_size:15508
- loss:CosineSimilarityLoss
base_model: sentence-transformers/all-MiniLM-L6-v2
widget:
- source_sentence: Looking for a Network Administrator with 4 years experience in
    managing enterprise networks and security configurations. with a focus on cloud
    infrastructure
  sentences:
  - Bachelor's degree in Blockchain Engineering
  - Developed AI-driven NPC behaviors using Unity’s ML Agents framework.
  - Implemented a multi-cloud deployment strategy reducing downtime by 40%.
- source_sentence: an NLP Engineer with 3 years experience in natural language processing.
    The candidate will work on chatbot and speech recognition projects.
  sentences:
  - Created an NFT marketplace handling over 500 daily transactions on Ethereum.
  - Optimized query performance, decreasing average response times by 40% in large-scale
    applications.
  - Bachelor's degree in Cloud Computing
- source_sentence: a Data Analyst with 3 years hands-on experience in data visualization
    and reporting. The candidate should be proficient in SQL and BI tools.
  sentences:
  - Ph.D. in AI
  - Developed an interactive social networking platform used by over 100,000 users.
  - Led the development of AI-powered recommendation engines for an e-commerce platform,
    improving user engagement by 30%. using DevOps practices
- source_sentence: Looking for a Digital Forensics Specialist with 4 years experience
    in cybercrime investigations and forensic analysis. with a focus on AI-driven
    solutions
  sentences:
  - Developed an e-commerce platform API handling over 50,000 daily requests. and
    deployed on Azure
  - Security, IoT, Network Security, Embedded Systems
  - Designed a warehouse automation system using AI-driven robots.
- source_sentence: a Site Reliability Engineer with 4 years experience in automating
    infrastructure monitoring and incident response.
  sentences:
  - Implemented an automated backup and disaster recovery system.
  - SecOps, Security Audits, Jenkins, Infrastructure Security
  - Network Security, IoT Security, Embedded Security, Encryption
pipeline_tag: sentence-similarity
library_name: sentence-transformers
metrics:
- pearson_cosine
- spearman_cosine
model-index:
- name: SentenceTransformer based on sentence-transformers/all-MiniLM-L6-v2
  results:
  - task:
      type: semantic-similarity
      name: Semantic Similarity
    dataset:
      name: dev set
      type: dev-set
    metrics:
    - type: pearson_cosine
      value: 0.7360800483872669
      name: Pearson Cosine
    - type: spearman_cosine
      value: 0.6759859211370117
      name: Spearman Cosine
---

# SentenceTransformer based on sentence-transformers/all-MiniLM-L6-v2

This is a [sentence-transformers](https://www.SBERT.net) model finetuned from [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). It maps sentences & paragraphs to a 384-dimensional dense vector space and can be used for semantic textual similarity, semantic search, paraphrase mining, text classification, clustering, and more.

## Model Details

### Model Description
- **Model Type:** Sentence Transformer
- **Base model:** [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) <!-- at revision c9745ed1d9f207416be6d2e6f8de32d1f16199bf -->
- **Maximum Sequence Length:** 256 tokens
- **Output Dimensionality:** 384 dimensions
- **Similarity Function:** Cosine Similarity
<!-- - **Training Dataset:** Unknown -->
<!-- - **Language:** Unknown -->
<!-- - **License:** Unknown -->

### Model Sources

- **Documentation:** [Sentence Transformers Documentation](https://sbert.net)
- **Repository:** [Sentence Transformers on GitHub](https://github.com/UKPLab/sentence-transformers)
- **Hugging Face:** [Sentence Transformers on Hugging Face](https://huggingface.co/models?library=sentence-transformers)

### Full Model Architecture

```
SentenceTransformer(
  (0): Transformer({'max_seq_length': 256, 'do_lower_case': False}) with Transformer model: BertModel 
  (1): Pooling({'word_embedding_dimension': 384, 'pooling_mode_cls_token': False, 'pooling_mode_mean_tokens': True, 'pooling_mode_max_tokens': False, 'pooling_mode_mean_sqrt_len_tokens': False, 'pooling_mode_weightedmean_tokens': False, 'pooling_mode_lasttoken': False, 'include_prompt': True})
  (2): Normalize()
)
```

## Usage

### Direct Usage (Sentence Transformers)

First install the Sentence Transformers library:

```bash
pip install -U sentence-transformers
```

Then you can load this model and run inference.
```python
from sentence_transformers import SentenceTransformer

# Download from the 🤗 Hub
model = SentenceTransformer("sentence_transformers_model_id")
# Run inference
sentences = [
    'a Site Reliability Engineer with 4 years experience in automating infrastructure monitoring and incident response.',
    'Implemented an automated backup and disaster recovery system.',
    'SecOps, Security Audits, Jenkins, Infrastructure Security',
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 384]

# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings, embeddings)
print(similarities.shape)
# [3, 3]
```

<!--
### Direct Usage (Transformers)

<details><summary>Click to see the direct usage in Transformers</summary>

</details>
-->

<!--
### Downstream Usage (Sentence Transformers)

You can finetune this model on your own dataset.

<details><summary>Click to expand</summary>

</details>
-->

<!--
### Out-of-Scope Use

*List how the model may foreseeably be misused and address what users ought not to do with the model.*
-->

## Evaluation

### Metrics

#### Semantic Similarity

* Dataset: `dev-set`
* Evaluated with [<code>EmbeddingSimilarityEvaluator</code>](https://sbert.net/docs/package_reference/sentence_transformer/evaluation.html#sentence_transformers.evaluation.EmbeddingSimilarityEvaluator)

| Metric              | Value     |
|:--------------------|:----------|
| pearson_cosine      | 0.7361    |
| **spearman_cosine** | **0.676** |

<!--
## Bias, Risks and Limitations

*What are the known or foreseeable issues stemming from this model? You could also flag here known failure cases or weaknesses of the model.*
-->

<!--
### Recommendations

*What are recommendations with respect to the foreseeable issues? For example, filtering explicit content.*
-->

## Training Details

### Training Dataset

#### Unnamed Dataset

* Size: 15,508 training samples
* Columns: <code>sentence_0</code>, <code>sentence_1</code>, and <code>label</code>
* Approximate statistics based on the first 1000 samples:
  |         | sentence_0                                                                         | sentence_1                                                                        | label                                                          |
  |:--------|:-----------------------------------------------------------------------------------|:----------------------------------------------------------------------------------|:---------------------------------------------------------------|
  | type    | string                                                                             | string                                                                            | float                                                          |
  | details | <ul><li>min: 16 tokens</li><li>mean: 28.58 tokens</li><li>max: 50 tokens</li></ul> | <ul><li>min: 8 tokens</li><li>mean: 15.22 tokens</li><li>max: 39 tokens</li></ul> | <ul><li>min: 0.0</li><li>mean: 0.27</li><li>max: 1.0</li></ul> |
* Samples:
  | sentence_0                                                                                                                                                                         | sentence_1                                                                                                                          | label            |
  |:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------|:-----------------|
  | <code>a Hardware Engineer with 4 years hands-on experience in designing and optimizing computer hardware components.</code>                                                        | <code>Forensics, Cybersecurity, Evidence Collection, Data Recovery</code>                                                           | <code>0.0</code> |
  | <code>Looking for a Quantum Computing Researcher with 5 years experience in developing quantum algorithms.</code>                                                                  | <code>Ph.D. in AI</code>                                                                                                            | <code>0.5</code> |
  | <code>a Site Reliability Engineer with 4 years experience in SRE. The candidate will be responsible for maintaining system reliability and automating monitoring solutions.</code> | <code>Developed backend services and APIs for high-traffic applications, leading to a 25% improvement in system performance.</code> | <code>0.0</code> |
* Loss: [<code>CosineSimilarityLoss</code>](https://sbert.net/docs/package_reference/sentence_transformer/losses.html#cosinesimilarityloss) with these parameters:
  ```json
  {
      "loss_fct": "torch.nn.modules.loss.MSELoss"
  }
  ```

### Training Hyperparameters
#### Non-Default Hyperparameters

- `eval_strategy`: steps
- `num_train_epochs`: 4
- `fp16`: True
- `multi_dataset_batch_sampler`: round_robin

#### All Hyperparameters
<details><summary>Click to expand</summary>

- `overwrite_output_dir`: False
- `do_predict`: False
- `eval_strategy`: steps
- `prediction_loss_only`: True
- `per_device_train_batch_size`: 8
- `per_device_eval_batch_size`: 8
- `per_gpu_train_batch_size`: None
- `per_gpu_eval_batch_size`: None
- `gradient_accumulation_steps`: 1
- `eval_accumulation_steps`: None
- `torch_empty_cache_steps`: None
- `learning_rate`: 5e-05
- `weight_decay`: 0.0
- `adam_beta1`: 0.9
- `adam_beta2`: 0.999
- `adam_epsilon`: 1e-08
- `max_grad_norm`: 1
- `num_train_epochs`: 4
- `max_steps`: -1
- `lr_scheduler_type`: linear
- `lr_scheduler_kwargs`: {}
- `warmup_ratio`: 0.0
- `warmup_steps`: 0
- `log_level`: passive
- `log_level_replica`: warning
- `log_on_each_node`: True
- `logging_nan_inf_filter`: True
- `save_safetensors`: True
- `save_on_each_node`: False
- `save_only_model`: False
- `restore_callback_states_from_checkpoint`: False
- `no_cuda`: False
- `use_cpu`: False
- `use_mps_device`: False
- `seed`: 42
- `data_seed`: None
- `jit_mode_eval`: False
- `use_ipex`: False
- `bf16`: False
- `fp16`: True
- `fp16_opt_level`: O1
- `half_precision_backend`: auto
- `bf16_full_eval`: False
- `fp16_full_eval`: False
- `tf32`: None
- `local_rank`: 0
- `ddp_backend`: None
- `tpu_num_cores`: None
- `tpu_metrics_debug`: False
- `debug`: []
- `dataloader_drop_last`: False
- `dataloader_num_workers`: 0
- `dataloader_prefetch_factor`: None
- `past_index`: -1
- `disable_tqdm`: False
- `remove_unused_columns`: True
- `label_names`: None
- `load_best_model_at_end`: False
- `ignore_data_skip`: False
- `fsdp`: []
- `fsdp_min_num_params`: 0
- `fsdp_config`: {'min_num_params': 0, 'xla': False, 'xla_fsdp_v2': False, 'xla_fsdp_grad_ckpt': False}
- `fsdp_transformer_layer_cls_to_wrap`: None
- `accelerator_config`: {'split_batches': False, 'dispatch_batches': None, 'even_batches': True, 'use_seedable_sampler': True, 'non_blocking': False, 'gradient_accumulation_kwargs': None}
- `deepspeed`: None
- `label_smoothing_factor`: 0.0
- `optim`: adamw_torch
- `optim_args`: None
- `adafactor`: False
- `group_by_length`: False
- `length_column_name`: length
- `ddp_find_unused_parameters`: None
- `ddp_bucket_cap_mb`: None
- `ddp_broadcast_buffers`: False
- `dataloader_pin_memory`: True
- `dataloader_persistent_workers`: False
- `skip_memory_metrics`: True
- `use_legacy_prediction_loop`: False
- `push_to_hub`: False
- `resume_from_checkpoint`: None
- `hub_model_id`: None
- `hub_strategy`: every_save
- `hub_private_repo`: None
- `hub_always_push`: False
- `gradient_checkpointing`: False
- `gradient_checkpointing_kwargs`: None
- `include_inputs_for_metrics`: False
- `include_for_metrics`: []
- `eval_do_concat_batches`: True
- `fp16_backend`: auto
- `push_to_hub_model_id`: None
- `push_to_hub_organization`: None
- `mp_parameters`: 
- `auto_find_batch_size`: False
- `full_determinism`: False
- `torchdynamo`: None
- `ray_scope`: last
- `ddp_timeout`: 1800
- `torch_compile`: False
- `torch_compile_backend`: None
- `torch_compile_mode`: None
- `dispatch_batches`: None
- `split_batches`: None
- `include_tokens_per_second`: False
- `include_num_input_tokens_seen`: False
- `neftune_noise_alpha`: None
- `optim_target_modules`: None
- `batch_eval_metrics`: False
- `eval_on_start`: False
- `use_liger_kernel`: False
- `eval_use_gather_object`: False
- `average_tokens_across_devices`: False
- `prompts`: None
- `batch_sampler`: batch_sampler
- `multi_dataset_batch_sampler`: round_robin

</details>

### Training Logs
| Epoch  | Step | Training Loss | dev-set_spearman_cosine |
|:------:|:----:|:-------------:|:-----------------------:|
| 0.1031 | 200  | -             | 0.4655                  |
| 0.2063 | 400  | -             | 0.5411                  |
| 0.2579 | 500  | 0.122         | -                       |
| 0.3094 | 600  | -             | 0.5414                  |
| 0.4126 | 800  | -             | 0.5854                  |
| 0.5157 | 1000 | 0.1009        | 0.5937                  |
| 0.6189 | 1200 | -             | 0.5998                  |
| 0.7220 | 1400 | -             | 0.6083                  |
| 0.7736 | 1500 | 0.0925        | -                       |
| 0.8252 | 1600 | -             | 0.6141                  |
| 0.9283 | 1800 | -             | 0.6289                  |
| 1.0    | 1939 | -             | 0.6298                  |
| 1.0315 | 2000 | 0.0892        | 0.6291                  |
| 1.1346 | 2200 | -             | 0.6299                  |
| 1.2378 | 2400 | -             | 0.6352                  |
| 1.2893 | 2500 | 0.0842        | -                       |
| 1.3409 | 2600 | -             | 0.6412                  |
| 1.4440 | 2800 | -             | 0.6406                  |
| 1.5472 | 3000 | 0.0787        | 0.6408                  |
| 1.6503 | 3200 | -             | 0.6394                  |
| 1.7535 | 3400 | -             | 0.6416                  |
| 1.8051 | 3500 | 0.0802        | -                       |
| 1.8566 | 3600 | -             | 0.6559                  |
| 1.9598 | 3800 | -             | 0.6610                  |
| 2.0    | 3878 | -             | 0.6669                  |
| 2.0629 | 4000 | 0.0779        | 0.6612                  |
| 2.1661 | 4200 | -             | 0.6583                  |
| 2.2692 | 4400 | -             | 0.6585                  |
| 2.3208 | 4500 | 0.0718        | -                       |
| 2.3724 | 4600 | -             | 0.6641                  |
| 2.4755 | 4800 | -             | 0.6666                  |
| 2.5786 | 5000 | 0.0726        | 0.6687                  |
| 2.6818 | 5200 | -             | 0.6686                  |
| 2.7849 | 5400 | -             | 0.6641                  |
| 2.8365 | 5500 | 0.0752        | -                       |
| 2.8881 | 5600 | -             | 0.6660                  |
| 2.9912 | 5800 | -             | 0.6704                  |
| 3.0    | 5817 | -             | 0.6699                  |
| 3.0944 | 6000 | 0.0717        | 0.6669                  |
| 3.1975 | 6200 | -             | 0.6710                  |
| 3.3007 | 6400 | -             | 0.6700                  |
| 3.3522 | 6500 | 0.0675        | -                       |
| 3.4038 | 6600 | -             | 0.6711                  |
| 3.5070 | 6800 | -             | 0.6747                  |
| 3.6101 | 7000 | 0.0696        | 0.6760                  |


### Framework Versions
- Python: 3.12.3
- Sentence Transformers: 3.4.1
- Transformers: 4.49.0
- PyTorch: 2.5.1+cu121
- Accelerate: 1.5.2
- Datasets: 3.4.0
- Tokenizers: 0.21.0

## Citation

### BibTeX

#### Sentence Transformers
```bibtex
@inproceedings{reimers-2019-sentence-bert,
    title = "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks",
    author = "Reimers, Nils and Gurevych, Iryna",
    booktitle = "Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing",
    month = "11",
    year = "2019",
    publisher = "Association for Computational Linguistics",
    url = "https://arxiv.org/abs/1908.10084",
}
```

<!--
## Glossary

*Clearly define terms in order to be accessible across audiences.*
-->

<!--
## Model Card Authors

*Lists the people who create the model card, providing recognition and accountability for the detailed work that goes into its construction.*
-->

<!--
## Model Card Contact

*Provides a way for people who have updates to the Model Card, suggestions, or questions, to contact the Model Card authors.*
-->